import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);

            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }
            await updateDoc(userRef, {
                lastSeen: Date.now()
            })
            setInterval(async () => {
                if (auth.chatUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now()
                    })
                }
            }, 60000);
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, "chats", userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                const chatDataFromDb = res.data()?.chatsData; // safely access chatData
                if (Array.isArray(chatDataFromDb)) { // Check if chatData is an array
                    const tempData = [];
                    for (const item of chatDataFromDb) {
                        const userRef = doc(db, "users", item.rId);
                        const userSnap = await getDoc(userRef);
                        const userData = userSnap.data();
                        tempData.push({ ...item, userData });
                    }
                    // Sort the chat data by the updatedAt field
                    setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
                } else {
                    // Handle the case where chatData is not an array
                    console.warn('chatData is not an array or is missing');
                    setChatData([]);
                }
            });

            return () => {
                unSub();
            };
        }
    }, [userData]);


    const value = {
        userData,
        setChatData,
        setUserData,
        chatData,
        loadUserData,
        messages,
        setMessages,
        messagesId,
        setMessagesId,
        chatUser,
        setChatUser,
        chatVisible,
        setChatVisible
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
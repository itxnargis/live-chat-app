import React, { useContext, useEffect, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { logout } from '../../config/firebase'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {
    const navigate = useNavigate();

    const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext);

    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, "users");
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id) {
                    let userExists = false;
                    // Use chatData here instead of chatsData
                    chatData && chatData.map((user) => {
                        if (user.rId === querySnap.docs[0].data().id) {
                            userExists = true;
                        }
                    });

                    if (!userExists) {
                        setUser(querySnap.docs[0].data());
                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const addChat = async () => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");

        try {
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            });

            const userChatRef = doc(chatsRef, user.id);
            const currentUserChatRef = doc(chatsRef, userData.id);

            // Check if the document exists, and create if necessary
            const userChatSnap = await getDoc(userChatRef);
            if (!userChatSnap.exists()) {
                await setDoc(userChatRef, {
                    chatsData: []
                });
            }

            const currentUserChatSnap = await getDoc(currentUserChatRef);
            if (!currentUserChatSnap.exists()) {
                await setDoc(currentUserChatRef, {
                    chatsData: []
                });
            }

            // Update documents with the new chat data
            await updateDoc(userChatRef, {
                chatsData: arrayUnion({
                    messagesId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });

            await updateDoc(currentUserChatRef, {
                chatsData: arrayUnion({
                    messagesId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });

            const uSnap = await getDoc(doc(db, "users", user.id));
            const uData = uSnap.data();
            setChat({
                messagesId: newMessageRef.id,
                lastMessage: "",
                rId: userData.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            });
            setShowSearch(false);
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    };


    const setChat = async (item) => {
        try {
            setMessagesId(item.messagesId);
            setChatUser(item);
            const userChatsRef = doc(db, "chats", userData.id);
            const userChatsSnapshot = await getDoc(userChatsRef);
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chatsData.findIndex((c) => c.messagesId === item.messagesId);
            userChatsData.chatsData[chatIndex].messageSeen = true;
            await updateDoc(userChatsRef, {
                chatData: userChatsData.chatsData
            });
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        const updateChatUserData = async () => {
            if (chatUser) {
                const userRef = doc(db, "users", chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser((prev) => ({ ...prev, userData: userData }));
            }
        };
        updateChatUserData();
    }, [chatData]);

    return (
        <div className={`left-sidebar ${chatVisible ? "hidden" : ""}`}>
            <div className="left-sidebar-top">
                <div className="left-sidebar-nav">
                    <img src={assets.logo} className="logo" alt="logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate("/profile")}>Edit Profile</p>
                            <hr />
                            <p onClick={()=>logout()}>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="left-sidebar-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder="Search here..." />
                </div>
            </div>

            <div className="left-sidebar-list">
                {
                    showSearch && user
                        ? <div onClick={addChat} className="friends add-user">
                            <img src={user.avatar} alt="" />
                            <p>{user.name}</p>
                        </div>
                        : chatData && chatData.map((item, index) => (
                            <div
                                onClick={() => setChat(item)}
                                key={index}
                                className={`friends ${!item.messageSeen ? "border" : ""}`}
                            >
                                <img src={item.userData.avatar} alt="" />
                                <div>
                                    <p>{item.userData.name}</p>
                                    <span>{item.lastMessage}</span>
                                </div>
                            </div>
                        ))
                }
            </div>
        </div>
    );
};

export default LeftSidebar;

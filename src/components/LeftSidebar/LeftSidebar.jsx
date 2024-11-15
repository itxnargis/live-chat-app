import React, { useContext, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {

    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext);
    const [user, setUser] = useContext(null);
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
                    let userExists = false
                    chatsData.map((user) => {
                        if (user.rId === querySnap.docs[0].data().id) {
                            userExists = true;
                        }
                    })

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

        }
    }

    const addChat = async () => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messagesId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messagesId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    }

    const setChat = async (item) => {
        try {
            setMessagesId(item.messagesId);
        setChatUser(item);
        const userChatsRef = doc(db, "chats", userData.id);
        const userChatsSnapshot = await getDocs(userChatsRef);
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messagesId === item.messagesId);
        userChatsData.chatsData[chatIndex].messageSeen = true;
        await updateDoc(userChatsRef, {
            chatData:userChatsData.chatsData
        })
        } catch (error) {
toast.error(error.message);
        }
    }

    return (
        <div className='left-sidebar'>
            <div className="left-sidebar-top">
                <div className="left-sidebar-nav">
                    <img src={assets.logo} className='logo' alt="logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="left-sidebar-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder='Search here...' />
                </div>
            </div>

            <div className="left-sidebar-list">
                {
                    showSearch && user
                        ? <div onClick={addChat} className="friends add-user">
                            <img src={user.avatar} alt="" />
                            <p>{user.name}</p>
                        </div>
                        : chatsData.map((item, index) => (
                            <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messagesId === messagesId ? "" : "border"}`}>
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
    )
}

export default LeftSidebar
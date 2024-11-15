import React from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'

const RightSidebar = () => {
  return (
    <div className='right-sidebar'>
      <div className="right-sidebar-profile">
        <img src={assets.profile_img} alt="" />
        <h3>Richard Sanford <img src={assets.green_dot} className='dot' alt="" /></h3>
        <p>Hey, there i am Richard Sanford using live chat</p>
      </div>

      <hr />
      <div className="right-sidebar-media">
        <p>Media</p>
        <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
        </div>
      </div>
      <button onClick={()=>logout()}>Logout</button>
    </div>
  )
}

export default RightSidebar
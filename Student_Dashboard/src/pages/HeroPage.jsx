import React from 'react'
import hero from "../assets/images/herobanner.png"
import {useNavigate} from "react-router-dom"
function HeroPage() {
  const style = {
    backgroundImage: `url(${hero})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  }

  let navigate=useNavigate()
  return (
    <div style={style} id='banner' className='h-[100vh] w-[100vw] flex  justify-center items-center flex-col'>
      <h1 className='text-red-100 text-[40px] font-bold'>Tech Hunting</h1>
      <button className='btn-explore' onClick={()=>navigate("/dashboard")}>Explore</button>
    </div>
  )
}

export default HeroPage
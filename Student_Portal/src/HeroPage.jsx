import React from 'react'
import hero from "./assets/images/herobanner.png"
import {useNavigate} from "react-router-dom"
function HeroPage() {
  const style = {
    backgroundImage: `url(${hero})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat:"no-repeat",
  }

  let navigate=useNavigate()
  return (
    <div style={{backgroundColor:"#007ea3"}}>
    <div style={style} id='banner' className='h-[100vh] w-[100vw]  position-relative'>
      {/* <h1 className='text-red-100 text-[40px] font-bold'>Tech Hunting</h1> */}
      <button className='btn-explore' onClick={()=>navigate("/dashboard")}>Let Start</button>
    </div>
    </div>
  )
}

export default HeroPage
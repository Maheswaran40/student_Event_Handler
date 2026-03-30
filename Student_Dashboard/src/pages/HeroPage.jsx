import React from 'react'
// import hero from "./assets/images/herobanner.png"
import {useNavigate} from "react-router-dom"
function HeroPage() {
 

  let navigate=useNavigate()
  return (
    <div style={{backgroundColor:"#007ea3"}} id='whole' >
    <div  id='banner' className='h-[100vh] w-[100vw]  '>
      {/* <h1 className='text-red-100 text-[40px] font-bold'>Tech Hunting</h1> */}
      <button className='btn-explore' onClick={()=>navigate("/dashboard")}>Let Start</button>
     {/* <center><button className='btn-explore' onClick={()=>navigate("/dashboard")}>Let Start</button></center>  */}
    </div>
    </div>
  )
}

export default HeroPage
import { useEffect , useState} from 'react'


export default function CustomCursor() {

const [position, setPosition] = useState({ x: 0, y: 0 });

useEffect(() =>{
  const movehandler = (e) =>{
    setPosition({ x: e.clientX, y: e.clientY });
  }

  window.addEventListener('mousemove', movehandler);

  return () => {
    window.removeEventListener('mousemove', movehandler);
  };
})


  return (
    <div className="pointer-event-none fixed top-0 left-0 z-[-999]"
    
    style={{ transform: `translate(${position.x - 40}px, ${position.y - 40}px)` }}
    > 


      <div className="w-20 h-20 rounded-full bg-linear-to-r from-pink-500 to-purple-500 blur-3xl opacity-100">


      </div>
    </div>
  )
}
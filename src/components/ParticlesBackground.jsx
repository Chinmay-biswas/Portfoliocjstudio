import { useEffect, useRef } from 'react'


export default function ParticlesBackground() {
const canvasRef = useRef(null);

useEffect(()=>{

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let particles =[];
    const particleCount =50;
    const colors = ['#6B27B0'];

    class Particle{
        constructor(){
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1+1;
            this.color =colors[Math.floor(Math.random()*colors.length)];
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;

        }


        draw(){
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0 , Math.PI*2);
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.fill();
        }


            update(){
                this.x += this.speedX;
                this.y += this.speedY;

                if(this.x < 0 )this.x = canvas.width;
                if(this.x > canvas.width) this.x = 0;
                if(this.y < 0 )this.y = canvas.height;
                if(this.y > canvas.height) this.y = 0;

                this.draw();
            }


    }



    function createParticles(){
        particles = [];
        for(let i=0 ; i< particleCount; i++){
            particles.push(new Particle());
        }
    }




    function handelResize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    }

    handelResize();
    window.addEventListener('resize', handelResize);

    let animationId;

    function animate(){
        ctx.clearRect(0,0, canvas.width, canvas.height);
        particles.forEach(particle => particle.update());
        animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handelResize);
    }

},[])

return (

    
    <canvas 
    ref = {canvasRef}
    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">    {/* Canvas for particle background  used here fixed for all*/}



    </canvas>



) 

}
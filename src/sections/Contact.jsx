
import { useState } from "react";
import { motion } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground"
const SERVICE_ID=import.meta.env.VITE_SERVICE_ID;
const TEMPLATE_ID=import.meta.env.VITE_TEMPLATE_ID;
const PUBLIC_KEY=import.meta.env.VITE_PUBLIC_KEY;
import emailjs from "@emailjs/browser";
import Astra from "../assets/Astra.png"




export default function Contact(){

const [formData,setFormData]=useState({
  name:"",
  email:"",
  company:"",
  opportunity:"",
  field:"",
  phone:"",
  message:""
});

const[errors,setErrors]=useState({});
const[status,setStatus]=useState("");

const handleChange=(e)=>{
  const {name,value}=e.target;
  if(name==="phone" && value && !/^\d+$/.test(value)) return;
  setFormData((p)=>({...p,[name]:value}));
  if(errors[name]) setErrors((p)=>({...p,[name]:""}))
}
const validateForm=()=>{
  const required = ["name", "email", "opportunity","field", "phone"];
const newErrors = {};

required.forEach((f) => {
  if (!formData[f].trim()) {
    newErrors[f] = "This field is required";
  }
});

// message required if opportunity is "other"
if (
  formData.opportunity.toLowerCase() === "Other" &&
  !formData.message.trim()
) {
  newErrors.message = "Please describe your opportunity";
}
  setErrors(newErrors);
  return !Object.keys(newErrors).length;
}

const handelSubmit = async(e)=>{
  e.preventDefault();
  if(!validateForm())return;
  setStatus("sending");

  try{
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        ...formData,
        from_name:formData.name,
        reply_to:formData.email,

      },
      PUBLIC_KEY

      
    );
    setStatus("success");
    setFormData({
      name:"",
      email:"",
      company:"",
      opportunity:"",
      field:"",
      phone:"",
      message:""
    });

  }
  catch(err){
    console.error("EmailJS Error:",err);
    setStatus("error");

  }

}

  return(
    <section id="contact" className="w-full min-h-screen relative bg-black overflow-hidden text-white py-20 px-6 md:px-20 flex flex-col md:flex-row items-center gap-10">
      <ParticlesBackground/>


      <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-10">
        <motion.div className="w-full md:w-1/2 flex justify-center"
        initial={{opacity:0,x:-50}}
        whileInView={{opacity:1,x:0}}
        transition={{duration:1}}
        >
          <motion.img src={Astra} alt="contact"
          className="w-72 md:w-96 lg:w-[420px] xl:w-[600px] 2xl:w-[650px] rounded-2xl shadow-lg object-cover"
          animate={{y:[0,-10,0]}}
          transition={{duration:1,repeat:Infinity,ease:"easeInOut"}}
          />
          
        </motion.div>


        <motion.div className="w-full md:w-1/2 bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10"
        initial={{opacity:0,x:50}}
        whileInView={{opacity:1,x:0}}
        transition={{duration:0.6}}
        >
          <h2 className="text-3xl font-bold mb-4">
            Let's Work Together
          </h2>


          <form className="flex flex-col gap-5" onSubmit={handelSubmit}>
            <div className="flex flex-col">
              <label className="mb-1">Your Name<span className="text-red-500">*</span></label>
              <input type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className={`p-3 rounded-md bg-white/10 border ${errors.name?"border-red-500":"border-gray-500"} text-white focus:outline-none focus:border-blue-500`} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Your E-Mail<span className="text-red-500">*</span></label>
              <input type="text"
              name="email"
              placeholder="Your E-Mail"
              value={formData.email}
              onChange={handleChange}
              className={`p-3 rounded-md bg-white/10 border ${errors.email?"border-red-500":"border-gray-500"} text-white focus:outline-none focus:border-blue-500`} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Company / Organization</label>
              <input type="text"
              name="company"
              placeholder="Your Company | College | Start UP | Firm"
              value={formData.company}
              onChange={handleChange}
              className={`p-3 rounded-md bg-white/10 border ${errors.company?"border-red-500":"border-gray-500"} text-white focus:outline-none focus:border-blue-500`} />
              {errors.company && <p className="text-red-500 text-xs">{errors.company}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Opportunity Type<span className="text-red-500">*</span></label>
                    <select
                      name="opportunity"
                      value={formData.opportunity}
                      onChange={handleChange}
                      className={`p-3 rounded-md bg-white/10 border ${
                        errors.opportunity
                          ? "border-red-500"
                          : "border-gray-500"
                      } text-white focus:outline-none focus:border-blue-500`}
                    >

                      <option value="" className="bg-black" disabled>
                        Select Opportunity
                      </option>

                      <option value="Internship" className="bg-black">
                        Internship
                      </option>

                      <option value="Job" className="bg-black">
                        Job Opportunity
                      </option>

                      <option value="Freelance" className="bg-black">
                        Freelance Project
                      </option>

                      <option value="Collaboration" className="bg-black">
                        Collaboration
                      </option>

                      <option value="Other" className="bg-black">
                        Other
                      </option>

                      <option value="" className="bg-gray-700 text-gray-300" disabled>
                        If you choose other fill the message field given below
                      </option>

                    </select>

                    {errors.opportunity && (
                      <p className="text-red-500 text-xs">
                        {errors.opportunity}
                      </p>
                    )}
              
            </div>

            <div className="flex flex-col">
                    <label className="mb-1">
                      Domain / Field
                      <span className="text-red-500">*</span>
                    </label>

                    <select
                      name="field"
                      value={formData.field}
                      onChange={handleChange}
                      className={`p-3 rounded-md bg-white/10 border ${
                        errors.field
                          ? "border-red-500"
                          : "border-gray-500"
                      } text-white focus:outline-none focus:border-blue-500`}
                    >

                      <option value="" className="bg-black" disabled>
                        Select Domain / Field
                      </option>

                      <option value="AI/ML Internship" className="bg-black">
                        AI / ML 
                      </option>

                      

                      <option value="Web Development Internship" className="bg-black">
                        Web Development
                      </option>

                      

                      <option value="Game Development Internship" className="bg-black">
                        Game Development 
                      </option>

                      

                      <option value="SDE Internship" className="bg-black">
                        SDE 
                      </option>

                      

                      <option value="Open Source Collaboration" className="bg-black">
                        Open Source Collaboration
                      </option>

                      <option value="Freelance Project" className="bg-black">
                        Freelance Project
                      </option>

                      <option value="Research Opportunity" className="bg-black">
                        Research Opportunity
                      </option>

                      <option value="Other" className="bg-black">
                        Other
                      </option>

                      <option
                        value=""
                        className="bg-gray-700 text-gray-300"
                        disabled
                      >
                        If you choose "Other", please fill the message field below
                      </option>

                    </select>

                    {errors.field && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.field}
                      </p>
                    )}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Phone No.<span className="text-red-500">*</span></label>
              <input type="text"
              name="phone"
              placeholder="Your Phone No."
              value={formData.phone}
              onChange={handleChange}
              className={`p-3 rounded-md bg-white/10 border ${errors.phone?"border-red-500":"border-gray-500"} text-white focus:outline-none focus:border-blue-500`} />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Message<span className="text-red-500">*</span></label>
              <textarea 
              name="message"
              rows={4}
              placeholder="Your message , you can say anything."
              value={formData.message}
              onChange={handleChange}
              className={`p-3 rounded-md bg-white/10 border ${errors.message?"border-red-500":"border-gray-500"} text-white focus:outline-none focus:border-blue-500`} />
              {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
            </div>

            {status&&(
              <p className={`text-sm ${status==="success"? "text-green-500":status==="error"?"text-red-400":"text-yellow-400"}`}>
                {status==="sending"?"sending...": status==="success"?"Message send successfully ✅" : "Something went wrong ❌"}
              </p>
            )}

            <motion.button className="bg-blue-600 hover:bg-blue-800  disabled:opacity-90 text-white py-3 rounded-md font-semibold transition"
              whileHover={{scale:1.05}}
              whileTap={{scale:0.95}}
              disabled={status==="sending"}
              type="submit"
            >
              {status==="sending"?"Sending...":"Send Message"}
              
            </motion.button>

          </form>


        </motion.div>

      </div>

    </section>
  )
}
import "../../index.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function ButtonLoadingPage() {
  const navigate = useNavigate();

const handleClick = () => {
  navigate("/login");
};


  return (
    <div className="mt-5">

      <motion.button className="text-2xl bg-blue-950 hover:bg-indigo-800 text-white font-bold py-4 px-8 rounded-lg" 
        onClick={handleClick} 
        whileHover={{ scale: 1.2 }}   
        onHoverStart={e => {}}
        onHoverEnd={e => {}}>
          ¡Empieza ahora!
        </motion.button>
    </div>

  );
}

import { motion } from "framer-motion";
import { fadeln } from "../variants";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function PriceCard() {

    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/Registro");
    };
    
    return (
        <section className="bg-slate-300 px-4 py-12">
            <motion.div className="mx-auto w-fit"
                            variants={fadeln("up",0.2)}
                            initial= "hidden"
                            whileInView={"show"}
                            viewport={{once:false, amount:0.7}}>
            <h1 className='text-7xl font-bold mb-16 text-blue-950 text-bold text-center leaning-7' id="precio">Planes</h1>
            <Card />
        </motion.div>
        </section>
);
};

const Card = () => {
    return (
        
        
    <motion.div
        whileHover="hover"
        transition={{
        duration: 1,
        ease: "backInOut",
        }}
        variants={{
        hover: {
            scale: 1.05,
        },
        }}

        
            className="relative h-96 w-80 shrink-0 overflow-hidden rounded-xl bg-slate-500 p-8"
    >
        <div className="relative z-10 text-white">
            <span className="mb-3 block w-fit rounded-full bg-white/30 px-3 py-0.5 text-sm font-light text-white">
            Básico
            </span>
        <motion.span
            initial={{ scale: 0.85 }}
            variants={{
            hover: {
                scale: 1,
            },
            }}
            transition={{
            duration: 1,
            ease: "backInOut",
            }}
            className="my-2 block origin-top-left  text-6xl font-black leading-[1.2]"
        >
            ₡6.500
            <br />
            al mes
        </motion.span>
        <p>
            Adquiere nuestra licencia para empezar a controlar los empleados de tu empresa
        </p>
        </div>
        <Link to="/Registro" className="absolute bottom-8 left-4 right-4 z-20 rounded border-2 border-white bg-white py-2 text-center font-black uppercase text-neutral-800 backdrop-blur transition-colors hover:bg-sky-50 hover:text-indigo-800">
            Empieza ahora
                </Link> 

    </motion.div>
);
};


export default PriceCard;
import { FaArrowRight } from "react-icons/fa6"

function Navbar(){
    return (
        <div className="bg-white shadow-sm w-full"> 
            <div className="container flex justify-between py-4 sm:py-3 items-center">
                <div className="font-bold text-3xl">BioDiverse</div>
                <div>
                    <button className='rounded-full flex items-center gap-2 !bg-secondary text-inputcolor' onClick={() => window.location.href = "/login"}>
                        Connexion
                        <FaArrowRight/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Navbar;
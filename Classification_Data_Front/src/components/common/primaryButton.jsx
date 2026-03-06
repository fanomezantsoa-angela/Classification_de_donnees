import { FaArrowRight } from "react-icons/fa6";

function PrimaryButton(){
    return (
        <>
            <div className="flex items-center group">
               <button className="!bg-primary h-[40px] text-primaryDark px-3 py-2 !rounded-none">En savoir plus</button>
               <FaArrowRight className="inline-block group-hover:!translate-x-2 duration-200 p-2 text-base h-[40px] w-[40px] bg-primaryDark text-white"/>
            </div>
        </>
    )
}

export default PrimaryButton;
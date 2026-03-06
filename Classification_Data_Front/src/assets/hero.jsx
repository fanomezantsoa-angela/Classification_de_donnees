import Hell from '../../../public/hell.png';
import PrimaryButton from '../common/primaryButton';
import './style.css'

function Hero(){
    return(
        <>
            <div className="heroBg w-full relative z-[-1] overflow-hidden">
                <div className="container bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 place-items-center min-h-[500px]">
                            <div className='space-y-7 text-dark order-2 sm:order-1'>
                                <h1 className='text-5xl'>Préserver la <span className='text-secondary text-7xl font-cursive'> Biodiversité</span>
                                <br/> c'est préserver <br />notre avenir.
                                </h1>
                                <p className='lg:pr-64'>Explorer, comprendre Ambatolahy</p>

                                <div>
                                    <PrimaryButton/>
                                </div>
                            </div>
                            <div className='order-1 sm:order-2 overflow-hidden'>
                                <img src={Hell} alt=""/> 
                                {/* className='w-full sm:scale-125 sm:translate-y-16' */}
                            </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Hero;
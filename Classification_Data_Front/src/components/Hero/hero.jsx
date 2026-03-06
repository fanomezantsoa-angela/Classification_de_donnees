import Hell from '../../assets/hell.png';
import PrimaryButton from '../common/primaryButton';
import './style.css'

function Hero(){
    return(
        <>
            <div className="heroBg w-full relative z-[-1] overflow-hidden">
                <div className="bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none">
                    <div className="min-h-[500px] flex items-center justify-center">
                            <div className='space-y-7 text-center text-dark'>
                                <h1 className='text-5xl'>Valoriser la <span className='text-secondary text-7xl font-cursive'> Biodiversité</span>
                                <br/> forestière par l'innovation technologique.
                                </h1>
                                <p>Des solutions concrètes pour rendre accessibles<br />les savoirs
                                 conservés dans les livres papier grâce à la numérisation.</p>
                                <p>Explorer, comprendre Ambatolahy</p>

                                <div>
                                    <PrimaryButton/>
                                </div>
                            </div>
                            {/* <div className='order-1 sm:order-2 overflow-hidden'>
                                <img src={Hell} alt=""/> 
                                className='w-full sm:scale-125 sm:translate-y-16'
                                #61A257
                                #6F6464
                            </div> */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Hero;
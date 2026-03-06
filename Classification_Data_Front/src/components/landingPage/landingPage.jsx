import Navbar from "../navbar/navbar";
import Hero from "../Hero/hero";
import Banner from "../banner/banner";

function LandingPage(){
    return(
        <>
            <div className="overflow-x-hidden w-full">
                <Navbar/>
                <Hero/>
                <Banner/>
            </div>
        </>
    )
}

export default LandingPage;
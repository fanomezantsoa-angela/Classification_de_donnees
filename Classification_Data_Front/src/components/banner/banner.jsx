import FunctionPrincipal from "./fonctionPrinc";
import { FaLeaf } from "react-icons/fa6";

function Banner(){
    return (
        <>
            <div className="overflow-hidden w-full relative">
                <div className="text-center space-y-6 my-10">
                    <p className="text-xl font-semibold text-green-800">Faciliter l'accès au savoir pour soutenir la conservation de la biodiversité.</p>
                    <p className='text-3xl font-bold text-green-800 uppercase'>Ce que notre plateforme vous offre</p>                    
                </div>
                <FunctionPrincipal/>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-6">
                    Une plateforme complète pour la gestion de vos données
                    </h2>
                <p className="text-lg text-gray-600 mb-8">
                    Notre écosystème intégré vous permet de centraliser, organiser et analyser l'ensemble de vos ressources numériques liées à la biodiversité.
                </p>
                <div className="flex justify-center">
                    <div className="space-y-4 text-left">
                        <div className="flex items-start">
                        <div className="bg-green-100 rounded-full p-1 mt-1 mr-4">
                            <div className="bg-green-600 rounded-full w-2 h-2"></div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Interface intuitive</h4>
                            <p className="text-gray-600">Tableau de bord personnalisable avec visualisations interactives</p>
                        </div>
                        </div>
                        <div className="flex items-start">
                        <div className="bg-green-100 rounded-full p-1 mt-1 mr-4">
                            <div className="bg-green-600 rounded-full w-2 h-2"></div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Collaboration en temps réel</h4>
                            <p className="text-gray-600">Travaillez simultanément sur les mêmes documents avec votre équipe</p>
                        </div>
                        </div>
                        <div className="flex items-start">
                        <div className="bg-green-100 rounded-full p-1 mt-1 mr-4">
                            <div className="bg-green-600 rounded-full w-2 h-2"></div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Sécurité renforcée</h4>
                            <p className="text-gray-600">Vos données sont protégées avec des systèmes de chiffrement avancés</p>
                        </div>
                        </div>
                    </div>
                </div>
                </div>
                {/* Footer section */}
                <footer className="bg-gray-900 text-gray-400 py-12">
                    <div className="container mx-auto px-6">
                        <div className="mb-8 md:mb-0">
                            <div className="flex items-center space-x-2 mb-4">
                                <FaLeaf className="text-green-500" size={24} />
                                <span className="font-bold text-xl text-white">BioDiverse</span>
                            </div>
                            <p className="max-w-xs">
                                Solution complète de numérisation et gestion de données pour la protection de la biodiversité.
                            </p>
                        </div>
                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                        <p>© 2025 BioDiverse. Tous droits réservés.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
                            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
                            <a href="#" className="hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                    </div>
                </footer>
            </div>
        </>
    )
}

export default Banner;
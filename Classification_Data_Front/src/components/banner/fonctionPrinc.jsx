import { motion } from 'framer-motion';
import { FaPlus, FaRegFileWord, FaLayerGroup, FaRegComment } from 'react-icons/fa6';

function FunctionPrincipal(){
    const functionnality = [
        {
            id: 1,
            title: 'Ajout de livre',
            desc: 'Téléversez directement vos livres déjà au format numérique.',
            icon:<FaPlus/>,
            bgcolor:"#1F7D53",
            delay: 0.3
        },
        {
            id: 2,
            title: 'Numérisation intelligent',
            desc: 'Extraction de contenu à partir de livres papier grâce à des outils avancés.',
            icon:<FaRegFileWord/>,
            bgcolor:'#60B5FF',
            delay: 0.6
        },
        {
            id: 3,
            title: 'Classification automatique',
            desc: 'Chaque paragraphe est identifié, indexé et classé automatiquement.',
            icon:<FaLayerGroup/>,
            bgcolor:"#FFD63A",
            delay: 0.9
        },
        {
            id: 4,
            title: 'Chatbot Intelligent',
            desc: 'Posez vos questions, trouvez des extraits en quelques secondes.',
            icon:<FaRegComment/>,
            bgcolor:"#102E50",
            delay: 0.9
        },
    ]
    return (
        <>
            <div className="w-full py-24">
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mx-6'>
                    {functionnality.map((item)=>{
                        return(
                            <div className='space-y-4 p-6 rounded-xl shadow-[0_0_22px_rgba(0,0,0,0.15)]'>
                                {/* icon section */}
                                <div 
                                    style={{backgroundColor: item.bgcolor}}
                                    className='w-10 h-10 rounded-lg flex justify-center items-center text-white'>
                                    <div className='text-2xl'>
                                        {item.icon}
                                    </div>
                                </div>
                                <p className='font-semibold'>{item.title}</p>
                                <p className='text-sm text-gray-500'>{item.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}

export default FunctionPrincipal;
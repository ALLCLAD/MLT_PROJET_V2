import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-base-200 text-base-content py-16 border-t border-base-content/5">
            <div className="container mx-auto px-4 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="flex flex-col">
                        <h5 className="text-2xl font-black text-primary mb-6">Math Learning Tool</h5>
                        <p className="opacity-60 text-sm leading-relaxed max-w-sm">Chaque enfant a le potentiel de devenir un génie des mathématiques.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <h6 className="font-bold mb-4 uppercase tracking-widest text-xs opacity-50">Newsletter</h6>
                        <div className="join w-full max-w-md shadow-lg rounded-full overflow-hidden">
                            <input className="input join-item w-full bg-base-100 border-none focus:outline-none" placeholder="votre@email.com" />
                            <button className="btn btn-primary join-item px-6 text-primary-content">S'abonner</button>
                        </div>
                    </div>
                    <div className="flex flex-col lg:items-end">
                        <h6 className="font-bold mb-6 uppercase tracking-widest text-xs opacity-50">Légal</h6>
                        <ul className="flex flex-col gap-4 text-sm opacity-70">
                            <li><a href="#" className="hover:text-primary transition-all">Confidentialité</a></li>
                            <li><a href="#" className="hover:text-primary transition-all">Conditions</a></li>
                        </ul>
                    </div>
                </div>
                <div className="divider my-10 opacity-10"></div>
            </div>
        </footer>
    );
};

export default Footer;
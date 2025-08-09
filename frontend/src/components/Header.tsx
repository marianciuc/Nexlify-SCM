import {Link} from '@tanstack/react-router';

import {LanguageSwitcher} from './LanguageSwitcher';

export default function Header() {
    return (
        <header className='p-2 flex gap-2 bg-white text-black justify-between'>
            <nav className='flex flex-row'>
                <div className='px-2 font-bold'>
                    <Link to='/'>Home</Link>
                </div>
            </nav>
            <div className='flex items-center gap-2'>
                <LanguageSwitcher/>
            </div>
        </header>
    );
}

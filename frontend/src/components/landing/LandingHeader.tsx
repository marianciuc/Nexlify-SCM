import {useNavigate} from '@tanstack/react-router';
import {
    Menu,
    X,
    ArrowRight,
    Globe,
    ChevronDown,
    Package,
    Users,
    Building,
    BarChart3,
    FileText,
    Phone,
    MapPin,
    Store,
    Truck,
    ShieldAlert,
} from 'lucide-react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Navigation header for the landing page
 * Professional B2B design with responsive layout and existing section links
 */
export function LandingHeader() {
    const navigate = useNavigate();
    const {i18n} = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        {
            label: 'Platform',
            href: '#platform',
            submenu: [
                {label: 'Supply Chain Challenges', href: '#problem-statement', icon: Building},
                {label: 'Platform Modules', href: '#platform-modules', icon: Package},
                {label: 'User Roles & Access', href: '#user-roles', icon: Users},
                {label: 'Technology Overview', href: '#technology', icon: BarChart3},
            ],
        },
        {
            label: 'Solutions',
            href: '#solutions',
            submenu: [
                {label: 'Solution Overview', href: '#solution-overview'},
                {label: 'Metrics & Performance', href: '#metrics'},
                {label: 'Security & Compliance', href: '#security'},
            ],
        },
        {
            label: 'Pricing',
            href: '#pricing',
        },
        {
            label: 'Company',
            href: '#company',
            submenu: [
                {label: 'Social Proof', href: '#social-proof', icon: FileText},
                {label: 'Contact Us', href: '#contact', icon: Phone},
                {label: 'About', href: '#about', icon: MapPin},
            ],
        },
    ];

    const languages = [
        {code: 'en', label: 'English', flag: 'EN'},
        {code: 'ru', label: 'Русский', flag: 'RU'},
        {code: 'cn', label: '中文', flag: 'CN'},
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

    const scrollToSection = (href: string) => {
        if (href.startsWith('#')) {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({behavior: 'smooth'});
            }
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <header className='fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200/50 z-50'>
            <div className='container mx-auto px-4'>
                <div className='flex items-center justify-between h-16 lg:h-20'>
                    {/* Logo */}
                    <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center'>
                            <Package className='w-6 h-6 text-white'/>
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-slate-900'>Nexlify-SCM</h1>
                            <p className='text-xs text-slate-600 hidden lg:block'>
                                Enterprise Supply Chain Platform
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className='hidden lg:flex items-center space-x-8'>
                        {navigationItems.map((item, index) => (
                            <div key={index} className='relative group'>
                                {item.submenu ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            className='flex items-center space-x-1 text-slate-700 hover:text-slate-900 transition-colors py-2 cursor-pointer'>
                                            <span className='font-medium'>{item.label}</span>
                                            <ChevronDown className='w-4 h-4'/>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='w-56 mt-2 border-slate-200'>
                                            {item.submenu.map((subItem, subIndex) => {
                                                const IconComp = 'icon' in subItem ? subItem.icon : undefined;
                                                return (
                                                    <DropdownMenuItem
                                                        key={subIndex}
                                                        onClick={() => scrollToSection(subItem.href)}
                                                        className='cursor-pointer hover:bg-slate-50'
                                                    >
                                                        {IconComp && <IconComp className='w-4 h-4 mr-2 text-slate-600' />}
                                                        <span className='text-slate-700'>{subItem.label}</span>
                                                    </DropdownMenuItem>
                                                );
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <button
                                        onClick={() => scrollToSection(item.href)}
                                        className='text-slate-700 hover:text-slate-900 transition-colors font-medium'
                                    >
                                        {item.label}
                                    </button>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right side actions */}
                    <div className='flex items-center space-x-4'>
                        {/* Language switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className='hidden lg:flex items-center space-x-1 text-slate-700 hover:text-slate-900 transition-colors'>
                                <Globe className='w-4 h-4'/>
                                <span className='text-sm font-medium'>
                  {currentLanguage?.flag || 'EN'} {currentLanguage?.label || 'English'}
                </span>
                                <ChevronDown className='w-3 h-3'/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='border-slate-200'>
                                {languages.map(lang => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className='cursor-pointer hover:bg-slate-50'
                                    >
                    <span className='text-slate-700'>
                      {lang.flag} {lang.label}
                    </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Workspace / View Selector Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs h-9 gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer'>
                                    <Store className='w-3.5 h-3.5' />
                                    <span>Выбрать вид (Демо)</span>
                                    <ChevronDown className='w-3.5 h-3.5 opacity-70' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-80 p-2 shadow-2xl border-slate-200'>
                                <div className='px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                                    Рабочие пространства платформы
                                </div>
                                <DropdownMenuItem onClick={() => navigate({to: '/buyer/catalog'})} className='flex items-start gap-2.5 p-2 rounded-md cursor-pointer hover:bg-slate-50'>
                                    <div className='p-1.5 bg-blue-100 text-blue-700 rounded-md shrink-0 mt-0.5'>
                                        <Store className='w-4 h-4' />
                                    </div>
                                    <div>
                                        <div className='font-bold text-xs text-slate-900'>Магазин / Закупки (Buyer)</div>
                                        <div className='text-[10px] text-muted-foreground'>Каталог, корзина, заказы, KSeF и RFQ</div>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate({to: '/supplier/dashboard'})} className='flex items-start gap-2.5 p-2 rounded-md cursor-pointer hover:bg-slate-50'>
                                    <div className='p-1.5 bg-emerald-100 text-emerald-700 rounded-md shrink-0 mt-0.5'>
                                        <Building className='w-4 h-4' />
                                    </div>
                                    <div>
                                        <div className='font-bold text-xs text-slate-900'>Кабинет поставщика (Supplier)</div>
                                        <div className='text-[10px] text-muted-foreground'>WMS комплектация, склад, оптовые цены</div>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate({to: '/logistics/map'})} className='flex items-start gap-2.5 p-2 rounded-md cursor-pointer hover:bg-slate-50'>
                                    <div className='p-1.5 bg-amber-100 text-amber-700 rounded-md shrink-0 mt-0.5'>
                                        <Truck className='w-4 h-4' />
                                    </div>
                                    <div>
                                        <div className='font-bold text-xs text-slate-900'>Логистика и TMS (Logistics)</div>
                                        <div className='text-[10px] text-muted-foreground'>Карта ТС онлайн, VRP 3D LIFO, e-CMR</div>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate({to: '/admin/analytics'})} className='flex items-start gap-2.5 p-2 rounded-md cursor-pointer hover:bg-slate-50'>
                                    <div className='p-1.5 bg-rose-100 text-rose-700 rounded-md shrink-0 mt-0.5'>
                                        <ShieldAlert className='w-4 h-4' />
                                    </div>
                                    <div>
                                        <div className='font-bold text-xs text-slate-900'>Административная панель (Admin)</div>
                                        <div className='text-[10px] text-muted-foreground'>BI Аналитика GMV, KYC проверка, Kafka DLT</div>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* CTA Buttons */}
                        <div className='hidden lg:flex items-center space-x-2'>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='text-slate-700 hover:text-slate-900 hover:bg-slate-50 cursor-pointer text-xs h-9'
                                onClick={() => navigate({to: '/auth/login'})}
                            >
                                Sign In
                            </Button>
                            <Button
                                size='sm'
                                className='bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 cursor-pointer text-xs h-9'
                                onClick={() => navigate({to: '/auth/login'})}
                            >
                                Register
                                <ArrowRight className='w-3.5 h-3.5 ml-1.5'/>
                            </Button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className='lg:hidden p-2 text-slate-700 hover:text-slate-900 transition-colors'
                        >
                            {isMobileMenuOpen ? <X className='w-6 h-6'/> : <Menu className='w-6 h-6'/>}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className='lg:hidden border-t border-slate-200 py-4'>
                        <nav className='space-y-4'>
                            {navigationItems.map((item, index) => (
                                <div key={index}>
                                    <button
                                        onClick={() => scrollToSection(item.href)}
                                        className='block w-full text-left font-medium text-slate-700 hover:text-slate-900 transition-colors py-2'
                                    >
                                        {item.label}
                                    </button>
                                    {item.submenu && (
                                        <div className='ml-4 mt-2 space-y-2'>
                                            {item.submenu.map((subItem, subIndex) => (
                                                <button
                                                    key={subIndex}
                                                    onClick={() => scrollToSection(subItem.href)}
                                                    className='block text-sm text-slate-600 hover:text-slate-900 transition-colors py-1'
                                                >
                                                    {subItem.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Mobile Language Switcher */}
                        <div className='border-t border-slate-200 pt-4 mt-4'>
                            <div className='flex flex-wrap gap-2'>
                                {languages.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                            currentLanguage?.code === lang.code
                                                ? 'bg-slate-100 text-slate-900'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {lang.flag} {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile CTA Buttons */}
                        <div className='border-t border-slate-200 pt-4 mt-4 space-y-3'>
                            <Button
                                variant='outline'
                                className='w-full border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                                onClick={() => navigate({to: '/auth/login'})}
                            >
                                Sign In
                            </Button>
                            <Button
                                className='w-full bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                                onClick={() => navigate({to: '/auth/login'})}
                            >
                                Register
                                <ArrowRight className='w-4 h-4 ml-2'/>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Trust indicators bar */}
            <div className='hidden lg:block bg-slate-50 border-b border-slate-200'>
                <div className='container mx-auto px-4'>
                    <div className='flex items-center justify-center space-x-8 py-2 text-xs text-slate-600'>
                        <div className='flex items-center space-x-1'>
                            <Badge variant='outline' className='text-xs border-slate-300 text-slate-700'>
                                SOC 2
                            </Badge>
                            <span>Certified</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <Badge variant='outline' className='text-xs border-slate-300 text-slate-700'>
                                GDPR
                            </Badge>
                            <span>Compliant</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <Badge variant='outline' className='text-xs border-slate-300 text-slate-700'>
                                99.9%
                            </Badge>
                            <span>Uptime SLA</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                            <Badge variant='outline' className='text-xs border-slate-300 text-slate-700'>
                                Enterprise
                            </Badge>
                            <span>Security</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

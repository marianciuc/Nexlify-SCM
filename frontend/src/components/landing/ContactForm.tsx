import {ArrowRight, Calendar, CheckCircle, Phone, Mail, MessageSquare} from 'lucide-react';
import {useState} from 'react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ContactFormData {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    role: string;
    companySize: string;
    industry: string;
    message: string;
}

/**
 * Interactive contact form for enterprise registration
 */
export function ContactForm() {
    const [formData, setFormData] = useState<ContactFormData>({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        role: '',
        companySize: '',
        industry: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (field: keyof ContactFormData, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <Card className='max-w-2xl mx-auto border-0 shadow-2xl'>
                <CardContent className='p-12 text-center'>
                    <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <CheckCircle className='w-10 h-10 text-green-600'/>
                    </div>

                    <h3 className='text-2xl font-bold text-gray-900 mb-4'>Thank You for Your Interest!</h3>
                    <p className='text-gray-600 mb-8'>
                        Our enterprise team will contact you within 24 hours to guide you through the
                        registration process.
                    </p>

                    <div className='grid md:grid-cols-3 gap-4 text-sm'>
                        <div className='flex items-center justify-center space-x-2 text-gray-600'>
                            <Calendar className='w-4 h-4'/>
                            <span>Contact within 24h</span>
                        </div>
                        <div className='flex items-center justify-center space-x-2 text-gray-600'>
                            <Phone className='w-4 h-4'/>
                            <span>Direct specialist call</span>
                        </div>
                        <div className='flex items-center justify-center space-x-2 text-gray-600'>
                            <MessageSquare className='w-4 h-4'/>
                            <span>Customized proposal</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='max-w-2xl mx-auto border-0 shadow-2xl'>
            <CardHeader className='text-center pb-2'>
                {' '}
                <div className='flex justify-center mb-4'>
                    <Badge className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2'>
                        Enterprise Registration
                    </Badge>
                </div>
                <CardTitle className='text-2xl font-bold text-gray-900'>Start Your Registration</CardTitle>
                <p className='text-gray-600'>
                    See how LogisticCommerce can transform your supply chain operations
                </p>
            </CardHeader>

            <CardContent className='p-8'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Name fields */}
                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='firstName'>First Name *</Label>
                            <Input
                                id='firstName'
                                type='text'
                                required
                                value={formData.firstName}
                                onChange={e => handleInputChange('firstName', e.target.value)}
                                className='bg-white border-gray-300 focus:border-blue-500'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='lastName'>Last Name *</Label>
                            <Input
                                id='lastName'
                                type='text'
                                required
                                value={formData.lastName}
                                onChange={e => handleInputChange('lastName', e.target.value)}
                                className='bg-white border-gray-300 focus:border-blue-500'
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className='space-y-2'>
                        <Label htmlFor='email'>Business Email *</Label>
                        <Input
                            id='email'
                            type='email'
                            required
                            value={formData.email}
                            onChange={e => handleInputChange('email', e.target.value)}
                            className='bg-white border-gray-300 focus:border-blue-500'
                            placeholder='name@company.com'
                        />
                    </div>

                    {/* Company details */}
                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='company'>Company Name *</Label>
                            <Input
                                id='company'
                                type='text'
                                required
                                value={formData.company}
                                onChange={e => handleInputChange('company', e.target.value)}
                                className='bg-white border-gray-300 focus:border-blue-500'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='role'>Your Role *</Label>
                            <Select onValueChange={value => handleInputChange('role', value)}>
                                <SelectTrigger className='bg-white border-gray-300 focus:border-blue-500'>
                                    <SelectValue placeholder='Select your role'/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='ceo'>CEO/President</SelectItem>
                                    <SelectItem value='coo'>COO</SelectItem>
                                    <SelectItem value='supply-chain'>VP Supply Chain</SelectItem>
                                    <SelectItem value='logistics'>Logistics Director</SelectItem>
                                    <SelectItem value='operations'>Operations Manager</SelectItem>
                                    <SelectItem value='procurement'>Procurement Manager</SelectItem>
                                    <SelectItem value='it'>IT Director</SelectItem>
                                    <SelectItem value='other'>Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Company size and industry */}
                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='companySize'>Company Size</Label>
                            <Select onValueChange={value => handleInputChange('companySize', value)}>
                                <SelectTrigger className='bg-white border-gray-300 focus:border-blue-500'>
                                    <SelectValue placeholder='Select company size'/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='startup'>Startup (1-50)</SelectItem>
                                    <SelectItem value='small'>Small (51-200)</SelectItem>
                                    <SelectItem value='medium'>Medium (201-1000)</SelectItem>
                                    <SelectItem value='large'>Large (1001-5000)</SelectItem>
                                    <SelectItem value='enterprise'>Enterprise (5000+)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='industry'>Industry</Label>
                            <Select onValueChange={value => handleInputChange('industry', value)}>
                                <SelectTrigger className='bg-white border-gray-300 focus:border-blue-500'>
                                    <SelectValue placeholder='Select industry'/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='manufacturing'>Manufacturing</SelectItem>
                                    <SelectItem value='retail'>Retail & E-commerce</SelectItem>
                                    <SelectItem value='healthcare'>Healthcare</SelectItem>
                                    <SelectItem value='automotive'>Automotive</SelectItem>
                                    <SelectItem value='technology'>Technology</SelectItem>
                                    <SelectItem value='food'>Food & Beverage</SelectItem>
                                    <SelectItem value='other'>Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Submit button */}
                    <Button
                        type='submit'
                        size='lg'
                        disabled={isSubmitting}
                        className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold'
                    >
                        {isSubmitting ? (
                            <>
                                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                Start Registration Process
                                <ArrowRight className='ml-2 w-5 h-5'/>
                            </>
                        )}
                    </Button>

                    {/* Contact options */}
                    <div className='pt-6 border-t border-gray-200'>
                        <p className='text-center text-sm text-gray-600 mb-4'>
                            Prefer to speak directly? Contact our enterprise team:
                        </p>
                        <div className='flex justify-center space-x-6 text-sm'>
                            <a
                                href='tel:+1-555-LOGIC'
                                className='flex items-center text-blue-600 hover:text-blue-700'
                            >
                                <Phone className='w-4 h-4 mr-1'/>
                                +1 (555) LOGIC-1
                            </a>
                            <a
                                href='mailto:enterprise@logisticcommerce.com'
                                className='flex items-center text-blue-600 hover:text-blue-700'
                            >
                                <Mail className='w-4 h-4 mr-1'/>
                                enterprise@logisticcommerce.com
                            </a>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

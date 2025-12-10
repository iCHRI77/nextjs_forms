"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
// Reemplaza la importación directa de PhoneInput con:
const PhoneInput = dynamic(
  () => import('react-phone-input-2'),
  {
    ssr: false, // Desactiva SSR para este componente
    loading: () => <input type="tel" className="w-full px-4 py-3 border border-black-300 rounded-lg" />
  }
);

export default function WellnessForm() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+1');
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Full Name:', fullName);
    console.log('Email:', email);
    console.log('Phone:', phone);
    try {
      await fetch('https://services.leadconnectorhq.com/hooks/7ZyRIymMAHtKkhNQ5p4M/webhook-trigger/127bab01-c988-4adf-b523-b5b591f9b31f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FullName: fullName,
          Email: email,
          Phone: phone,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Webhook error:', error);
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto p-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Left column - Images - Hidden on mobile */}
          <div className='hidden md:flex justify-center items-center'>
            <img src="left_img.png" className='w-full h-auto max-w-full' />
          </div>

          {/* Right column - Form */}
          <div className='mx-auto flex flex-col justify-center max-w-[100%] gap-4'>
            <img className='mx-auto' src="FrontCareLogo.png" alt="logo" width={125} />
            <h1 className='mx-auto text-center mt-12 text-4xl font-bold text-gray-900 mb-4 font-gilda-display max-w-[90%]'>
              Stay on top of your Wellness
            </h1>
            <p className='mx-auto text-center mt-4 text-gray-600 mb-5 max-w-[70%]'>
              Sign up for new products added, special offers, and more.
            </p>


            {submitted ? (
              <p className="mt-4 text-center text-green-600 font-medium">Thanks for your submission</p>
            ) :
              (
                <form className='mx-auto space-y-1 max-w-[85%] sm:max-w-[85%] min-w-[85%] sm:min-w-[85%]' onSubmit={handleSubmit}>
                  <div>
                    <input
                      type='text'
                      placeholder='Full Name'
                      className='w-full px-4 py-3 border border-black-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type='email'
                      placeholder='Email'
                      className='w-full px-4 py-3 border border-black-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <PhoneInput
                    country={'us'}
                    value={phone}
                    onChange={phone => setPhone(phone)}
                    containerClass='phone-input-container'
                    inputProps={{
                      name: 'phone',
                      required: true,
                    }}
                  />

                  <div className='mb-4 mt-2'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='marketing'
                        className='flex-none w-7 h-7 text-blue-600 border-black rounded-lg focus:ring-blue-500'
                        style={{
                          borderRadius: '15px !important',
                        }}
                        required
                      />

                      <div className='mx-auto'>
                        <label htmlFor='marketing' className='flex-auto text-[10px] sm:text-[10px] lg:text-[12px] text-gray-600 text-center whitespace-nowrap tracking-tight leading-none'>
                          Yes, sign me for sms and email marketing from FrontCare.
                        </label>
                        <a href='https://www.frontcare.com/privacy-policy-shoppers/' className='flex-auto block underline text-[10px] sm:text-[10px] lg:text-[12px] text-gray-600 text-center tracking-tight leading-none -mt-[2px]'>
                          Privacy Policy
                        </a>
                      </div>
                    </div>
                  </div>

                  <button
                    type='submit'
                    className='w-full bg-black text-white py-3 px-6 rounded-lg font-semibold cursor-pointer'
                  >
                    YES PLEASE
                  </button>

                  <div className='text-center'>
                    <button onClick={() => window.location.href = 'https://www.frontcare.com/'} className='w-full text-center py-3 px-6 text-black hover:text-gray-800 underline'>
                      No Thanks
                    </button>
                  </div>
                </form>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SupportData {
  faqs: FAQ[];
  contactInfo: {
    email: string;
    phone: string;
    hours: string;
  };
  responseMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor() { }

  getSupportData() {
    const mockData: SupportData = {
      faqs: [
        {
          id: 1,
          question: 'How do I reset my password?',
          answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.',
          category: 'Account'
        },
        {
          id: 2,
          question: 'How accurate are the crop predictions?',
          answer: 'Our predictions are based on historical data, current weather conditions, and advanced algorithms. Accuracy varies by crop type and region, typically ranging from 75-90%.',
          category: 'Predictions'
        },
        {
          id: 3,
          question: 'Can I export my reports?',
          answer: 'Yes, you can export reports in PDF format from the Reports page. Click on any report and select the export option.',
          category: 'Reports'
        },
        {
          id: 4,
          question: 'How do I update my farm information?',
          answer: 'Go to your Profile page and click on "Edit Profile" to update your farm size, crops, and location information.',
          category: 'Profile'
        },
        {
          id: 5,
          question: 'What weather data sources do you use?',
          answer: 'We use data from multiple reliable meteorological sources including local weather stations and satellite imagery for accurate forecasts.',
          category: 'Weather'
        },
        {
          id: 6,
          question: 'How often are predictions updated?',
          answer: 'Predictions are updated daily based on new weather data and crop growth monitoring. Critical alerts are sent in real-time.',
          category: 'Predictions'
        }
      ],
      contactInfo: {
        email: 'support@hassad.jo',
        phone: '+962 77 123 4567',
        hours: 'Sunday - Thursday: 8:00 AM - 6:00 PM'
      },
      responseMessage: 'Thank you for contacting Hassad support. We will respond to your inquiry within 24 hours.'
    };
    return of(mockData);
  }

  submitContactForm(formData: ContactForm) {
    // Mock submission - in real app, this would send to backend
    return of({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!'
    });
  }
}



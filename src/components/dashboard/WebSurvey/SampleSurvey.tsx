// SampleSurvey.jsx
import { useState } from 'react';
import SurveyContainer from './SurveyContainer';

// Sample survey data structure
const sampleSurvey = {
  title: 'Paragon FYP Survey',
  description: 'This is fyp project survey about school systems',
  sections: [
    {
      id: 'section1',
      title: 'Section I: Introduction',
      description: "This online trivial questionnaire has been made to get valuable insight from you. I'm tired.",
      questions: [
        {
          id: 'q1',
          type: 'text',
          label: 'What is your name?',
          required: true,
        },
        {
          id: 'q2',
          type: 'text_area',
          label: 'Describe your name in full sentences',
          required: false,
        },
        {
          id: 'q3',
          type: 'single',
          label: 'Gender',
          required: true,
          options: ['I identify as Female', 'I identify as Male', 'I identify as Non-binary', 'I identify as Other'],
        },
        {
          id: 'q4',
          type: 'multiple',
          label: 'How much do I love me?',
          required: false,
          options: [
            'I identify that you love me',
            'I identify you love me a lot',
            'I identify you love me to the moon',
            'I identify you love me to the mars',
            'I identify you love me through life',
          ],
        },
      ],
    },
    {
      id: 'section2',
      title: 'Section II: Dong Kloun',
      description: "This online trivial questionnaire has been made to get valuable insight from you. I'm tired.",
      questions: [
        {
          id: 'q5',
          type: 'text',
          label: 'What is your name?',
          required: true,
        },
        {
          id: 'q6',
          type: 'text_area',
          label: 'Describe your name in full sentences',
          required: false,
        },
        {
          id: 'q7',
          type: 'single',
          label: 'Gender',
          required: true,
          options: ['I identify as Female', 'I identify as Male', 'I identify as Non-binary', 'I identify as Other'],
        },
        {
          id: 'q8',
          type: 'multiple',
          label: 'How much do I love me?',
          required: false,
          options: [
            'I identify that you love me',
            'I identify you love me a lot',
            'I identify you love me to the moon',
            'I identify you love me to the mars',
            'I identify you love me through life',
          ],
        },
      ],
    },
    {
      id: 'section3',
      title: 'Section III: Conclusion Hz Miz tt',
      description: '',
      questions: [
        {
          id: 'q9',
          type: 'text',
          label: 'What is your name?',
          required: true,
        },
        {
          id: 'q10',
          type: 'text_area',
          label: 'Describe your name in full sentences',
          required: false,
        },
        {
          id: 'q11',
          type: 'single',
          label: 'Gender',
          required: true,
          options: ['I identify as Female', 'I identify as Male', 'I identify as Non-binary', 'I identify as Other'],
        },
        {
          id: 'q12',
          type: 'multiple',
          label: 'How much do I love me?',
          required: false,
          options: [
            'I identify that you love me',
            'I identify you love me a lot',
            'I identify you love me to the moon',
            'I identify you love me through life',
          ],
        },
      ],
    },
  ],
};

// Sample usage
const SampleSurveyApp = () => {
  return (
    <div>
      <SurveyContainer survey={sampleSurvey} />
    </div>
  );
};

export default SampleSurveyApp;

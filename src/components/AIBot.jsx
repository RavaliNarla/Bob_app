import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMicrophone, faPlus } from '@fortawesome/free-solid-svg-icons';
import chatbot_ai from '../assets/chatbot_ai.png';

const AIBot = () => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

  const suggestedPrompts = [
    'Answer all your questions. (Just ask me anything you like)',
    'Generate all the text you want (essay, article, report & more)',
    'Conversational AI (I can talk to you like a human being)',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // console.log('Message sent:', message);
      setMessage('');
    }
  };

  return (
    <div className="d-flex flex-column h-100" style={{ width: '320px', backgroundColor: '#fff', borderLeft: '1px solid #e0e0e0' }}>
      {/* Header */}
      

      {/* Tabs */}
      

      {/* Content Area */}
      <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
        {activeTab === 'chat' ? (
          <div className="d-flex flex-column h-100 justify-content-center align-items-center">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: '#FFEBEE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '-20px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '-20px'
              }}>
                <img src={chatbot_ai} alt="Chatbot AI" style={{ width: '60px', height: '60px' }} />
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#757575', marginBottom: '24px' }}>How can I help you today?</p>
            
            <div className="w-100">
              {suggestedPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="p-3 mb-2 rounded"
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EEEEEE',
                    fontSize: '13px',
                    color: '#212121',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onClick={() => setMessage(prompt.split('(')[0].trim())}
                >
                  {prompt}
                </div>
              ))}
              <div 
                className="p-3 mb-2 rounded text-center"
                style={{
                  backgroundColor: 'rgb(255, 231, 222)',
                  border: '1px solid #FFCCBC',
                  fontSize: '13px',
                  color: '#E65100',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '32px',
                  marginBottom: '16px',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFCCBC'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgb(255, 231, 222)'}
                // onClick={() => console.log('Get Job Description clicked')}
              >
                Get Job Description using AI Prompts
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center" style={{ paddingTop: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              backgroundColor: '#FFF3E0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                backgroundColor: '#FF9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                AI
              </div>
            </div>
            <h6 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No prompts yet</h6>
            <p style={{ fontSize: '14px', color: '#757575', marginBottom: '24px' }}>Create your first prompt to get started</p>
            <Button 
              style={{
                backgroundColor: '#FF7043',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 24px',
                fontSize: '14px',
                fontWeight: 600
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F4511E'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF7043'}
            >
              Create Prompt
            </Button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-top">
        <Form onSubmit={handleSubmit} className="position-relative">
          <Form.Control
            type="text"
            placeholder="Get job description using AI prompts"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              borderRadius: '20px',
              border: '1px solid #E0E0E0',
              padding: '8px 40px 8px 16px',
              fontSize: '14px',
              boxShadow: 'none',
              paddingRight: '40px'
            }}
          />
          <Button
            variant="link"
            className="position-absolute end-0 top-0 p-0 me-3"
            style={{
              height: '100%',
              minWidth: '24px',
              color: message.trim() ? '#FF7043' : '#9E9E9E',
              textDecoration: 'none',
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none'
            }}
            onClick={handleSubmit}
          >
            <FontAwesomeIcon 
              icon={message.trim() ? faPaperPlane : faMicrophone} 
              style={{ fontSize: '16px' }} 
            />
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AIBot;

import React, { useState } from 'react';
import { submitQuestions2 } from '../services/apiServices';
import { useNavigate } from 'react-router-dom';

const RemoveButton = ({ onClick, isQuestion, text }) => (
  <button className={isQuestion ? "remove-button-text" : "remove-button"} onClick={onClick}>
    {isQuestion ? text : "×"}
  </button>
);

const CreateTest = () => {
  const navigate = useNavigate();
  const [testTitle, setTestTitle] = useState('');
  const [testIntroduction, setTestIntroduction] = useState('');
  const [questions, setQuestions] = useState([]);
  const [link, setLink] = useState('');

  const addTrueFalseQuestion = () => {
    setQuestions([...questions, { type: 'truefalse', text: 'Is this statement true or false?', correctAnswer: null, difficulty: 'easy' }]);
  };

  const addMultipleChoiceQuestion = () => {
    setQuestions([...questions, { type: 'multiplechoice', text: '', options: ['', '', '', ''], correctAnswer: null, difficulty: 'easy' }]);
  };

  const addFillInTheBlankQuestion = () => {
    setQuestions([...questions, { type: 'fillintheblank', text: '____ is the capital of France.', correctAnswer: '', difficulty: 'easy' }]);
  };

  const addMultipleResponseQuestion = () => {
    setQuestions([...questions, { type: 'multipleresponse', text: '', options: ['', '', '', ''], correctAnswers: [], difficulty: 'easy' }]);
  };

  const handleDifficultyChange = (qIndex, difficulty) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].difficulty = difficulty;
    setQuestions(updatedQuestions);
  };

  const handleQuestionTextChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].text = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optionIndex] = value;

    // If the option is empty, remove it
    if (newQuestions[qIndex].options[optionIndex].trim() === '') {
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, index) => index !== optionIndex);
    }

    // Automatically add a new empty option if the last option is filled
    if (newQuestions[qIndex].options.length > 0 && newQuestions[qIndex].options[newQuestions[qIndex].options.length - 1] !== '') {
      newQuestions[qIndex].options.push('');
    }

    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  const handleFillInTheBlankAnswerChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (qIndex) => {
    const updatedQuestions = questions.filter((_, index) => index !== qIndex);
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (qIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, index) => index !== optionIndex);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await submitQuestions2(testTitle, testIntroduction, questions);
      const testId = result.test_id;
      const generatedLink = `http://localhost:3000/test/${testId}`;
      localStorage.setItem("testId", testId);
      setLink(generatedLink);
      navigate('/publish');
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div className="test-form">
      <h1><b>Create Questions</b></h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group0">
          <label className="form-label">Test Name</label>
          <input
            type="text"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            placeholder="Enter test title"
            required
            className="input-field"
          />
        </div>

        <div className="form-group0">
          <label className="form-label">Introduction</label>
          <textarea
            value={testIntroduction}
            onChange={(e) => setTestIntroduction(e.target.value)}
            placeholder="Enter test introduction"
            required
            rows="3"
            className="textarea-field"
          />
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="question-group">
            <div className="question-content">
              <div className="question-number">{qIndex + 1}.</div>
              <textarea
                placeholder="Enter the question 1 here"
                value={question.text}
                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                className="textarea-field question-text"
              />
              <RemoveButton isQuestion={true} text="Remove Question" onClick={() => handleRemoveQuestion(qIndex)} />

              {/* Dropdown for setting difficulty */}
              <div className="dropdown">
                <button className="dropdown-btn">⋮</button>
                <div className="dropdown-content">
                  <button type="button" onClick={() => handleDifficultyChange(qIndex, 'easy')} style={{ backgroundColor: '#c1e1c1' }}>Easy</button>
                  <button type="button" onClick={() => handleDifficultyChange(qIndex, 'medium')} style={{ backgroundColor: '#ffeb99' }}>Medium</button>
                  <button type="button" onClick={() => handleDifficultyChange(qIndex, 'hard')} style={{ backgroundColor: '#f6a5a5' }}>Hard</button>
                </div>
              </div>
            </div>

            <div className="form-group">
              {question.type === 'multiplechoice' && (
                <>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option-group">
                      <label className="flex-label">
                        <input
                          type="radio"
                          name={`correctAnswer-${qIndex}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => handleCorrectAnswerChange(qIndex, optionIndex)}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="custom-input"
                        />
                        <RemoveButton onClick={() => handleRemoveOption(qIndex, optionIndex)} />
                      </label>
                    </div>
                  ))}
                </>
              )}

              {question.type === 'truefalse' && (
                <div className="form-group">
                  <label>
                    <input
                      type="radio"
                      name={`correctAnswer-${qIndex}`}
                      value="true"
                      checked={question.correctAnswer === true}
                      onChange={() => handleCorrectAnswerChange(qIndex, true)}
                    />
                    True
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name={`correctAnswer-${qIndex}`}
                      value="false"
                      checked={question.correctAnswer === false}
                      onChange={() => handleCorrectAnswerChange(qIndex, false)}
                    />
                    False
                  </label>
                </div>
              )}

              {question.type === 'fillintheblank' && (
                <>
                  <label>
                    Answer: 
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) => handleFillInTheBlankAnswerChange(qIndex, e.target.value)}
                      placeholder="Type your answer"
                      required
                      className="input-field"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={addMultipleChoiceQuestion}>Multiple Choice</button>
        <button type="button" onClick={addTrueFalseQuestion}>True/False</button>
        <button type="button" onClick={addMultipleResponseQuestion}>Multiple Response</button>
        <button type="button" onClick={addFillInTheBlankQuestion}>Fill-in-Blanks</button>
        <button type="submit">Save</button>

        {link && (
          <div className="test-link-container">
            <p>Your test is published and available at:</p>
            <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
          </div>
        )}
      </form>

      <style jsx>{`
        .test-form {
          margin-left: 225px;
          text-align: center;
          font-family: Arial, sans-serif;
          background-color: #f2f2f3;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          width: auto;
          min-height: 699px;
        }

        .form-group0 {
          margin-bottom: 16px;
          text-align: left;
          width: 75%;
          margin: 0 auto;
        }

        .form-label {
          font-weight: bold;
          margin-bottom: 8px;
          display: block;
        }

        .textarea-field {
          border: none;
        }

        label {
          display: flex;
          align-items: center;
        }

        .input-field,
        .textarea-field,
        .custom-input {
          width: 100%;
          padding: 10px;
          margin: 0;
          border: none;
          border-radius: 4px;
          outline: none;
        }

        .question-group {
          margin-top: 20px !important;
          margin-bottom: 10px !important;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: 75%;
          margin: 0 auto;
        }

        .question-content {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
        }

        .question-number {
          font-weight: bold;
          font-size: 1.2em;
          width: 35px;
        }

        .form-group {
          margin-bottom: 16px;
          text-align: left;
        }

        .option-group {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 10px;
        }

        .remove-button {
          background: none;
          border: none;
          color: #ff4d4d;
          font-size: 1.5em;
          cursor: pointer;
          transition: color 0.3s;
        }

        .remove-button-text {
          background: none;
          border: none;
          color: #ff4d4d;
          font-size: 1em;
          cursor: pointer;
          transition: color 0.3s;
        }

        button {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
          transition: background-color 0.3s;
        }

        .test-link-container {
          background-color: #f8f9fa;
          padding: 20px;
          border: 1px solid #dde9f5;
          border-radius: 8px;
          text-align: center;
          max-width: 400px;
          margin: 20px auto;
          font-family: Arial, sans-serif;
        }

        .test-link-container p {
          font-size: 16px;
          color: #333;
          margin-bottom: 10px;
        }

        .test-link-container a {
          color: #1760c1;
          font-weight: bold;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .test-link-container a:hover {
          color: #0056b3;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default CreateTest;

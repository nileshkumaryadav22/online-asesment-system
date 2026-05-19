exports.evaluateDescriptiveAnswer = (answerText, keywords, maxMarks) => {
  if (!answerText) return 0;
  
  // If the teacher didn't provide any keywords to check against, 
  // we award full marks if the student wrote a reasonable amount of code/text (> 10 chars).
  if (!keywords || keywords.length === 0) {
    return answerText.trim().length > 10 ? maxMarks : 0;
  }
  
  const text = answerText.toLowerCase();
  let matchedCount = 0;
  
  keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      matchedCount++;
    }
  });

  const ratio = matchedCount / keywords.length;
  // Simple heuristic: if they hit >= 80% keywords, full marks. 
  // Else proportionate.
  let marks = (ratio / 0.8) * maxMarks;
  if (marks > maxMarks) marks = maxMarks;
  
  return Math.round(marks * 10) / 10; // Round to 1 decimal
};

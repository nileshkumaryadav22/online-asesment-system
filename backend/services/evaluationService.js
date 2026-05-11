exports.evaluateDescriptiveAnswer = (answerText, keywords, maxMarks) => {
  if (!answerText || !keywords || keywords.length === 0) return 0;
  
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

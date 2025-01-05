export const inappropriateWords = [
    'tolol',
    'bodoh',
    'goblok',
    // tambahkan kata-kata lain yang dianggap tidak pantas
  ].map(word => word.toLowerCase());
  
  export const validateMessage = (message) => {
    if (!message) return { isValid: false, invalidWords: [] };
    
    const lowercaseMessage = message.toLowerCase();
    const foundInappropriateWords = inappropriateWords.filter(word => 
      lowercaseMessage.includes(word)
    );
    
    return {
      isValid: foundInappropriateWords.length === 0,
      invalidWords: foundInappropriateWords
    };
  };
  
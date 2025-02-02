import { useState } from 'react'

// Define reusable hook for managing server responses
const useServerResponse = () => {
    const [response, setResponse] = useState('');
    return {response, setResponse};
};

export default useServerResponse
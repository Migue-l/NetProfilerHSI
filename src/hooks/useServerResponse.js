import { useState } from 'react'

// Define reusable hook for managing server responses
const useServerResponse = (stateText) => {
    const [response, setResponse] = useState(stateText);
    return {response, setResponse};
};

export default useServerResponse
import axios from "axios";

const downloadFile = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "stream",
  });
  return response.data;
};

export default downloadFile;

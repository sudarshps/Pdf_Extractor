import React from "react";
import { ProgressBar } from "react-loader-spinner";


const Loader2:React.FC = () => {
  return (
    <div>
        <ProgressBar
  visible={true}
  height="80"
  width="80"
  ariaLabel="progress-bar-loading"
  wrapperStyle={{}}
  wrapperClass=""
  />
    </div>
  );
};

export default Loader2;

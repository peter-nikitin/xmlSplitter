import Sinon from "sinon";
import sinon, { SinonSandbox } from "sinon";

const sinonStubs = (sinon: SinonSandbox, port: string) => {
  sinon.stub(process.env, "FTP_HOST").value("127.0.0.1");
  sinon.stub(process.env, "FTP_USER").value("test");
  sinon.stub(process.env, "FTP_PASS").value("test");
  sinon.stub(process.env, "FTP_PORT").value(port || "8888");
};

export default sinonStubs;

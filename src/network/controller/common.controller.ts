import { BaseController } from "./base.controller";
class CommomController extends BaseController {
  async getEpidemicInfo(file?: FormData) {
    const res = await this.sever1.post(
      "/bigFileUpload",
      file
    );

    return res;
  }
  async merChunk(file?: any) {
    const res = await this.sever1.post(
     "/upload/merge",
      file
    );

    return res;
  }
}

export default new CommomController();
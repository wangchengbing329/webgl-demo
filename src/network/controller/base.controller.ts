import { BaseServer } from "../server/base.server";
import { BusinessServerV1 } from "../server/business.server";
// tslint:disable-next-line:no-unnecessary-class
export class BaseController<T = {}> {
  /** 服务器 */
  protected server?: BaseServer;
  protected sever1: BusinessServerV1 = new BusinessServerV1("tokenV1")
}

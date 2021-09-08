/*
 * @license
 * Copyright (c) 2018, the Gago Inc All rights reserved.
 * @author: xiaZQ (xiazhiqiang@gagogroup.com)
 * @created: 2019/2/13 5:37 PM
 */

import { BaseServer } from "./base.server";
import { AxiosRequestConfig } from "axios";
// import { serverConfig } from "../server-config";

/**
 * 业务代码接口服务（第一版本）
 *
 * @export
 * @class Business
 * @extends {BaseServer}
 */
export class BusinessServerV1 extends BaseServer {
  constructor(protected token: string) {
    super(`http://localhost:8000/api/v1`);
  }

  public async get<T>(url: string, setting?: AxiosRequestConfig) {
    const finalSetting = { ...(setting ? setting : { params: {} }), baseURL: this.domian };
    return super.get<T>(url, { ...finalSetting, headers: { } })
      .then(
        res => {
          if (res) {
            return res.data;
          }
          return res;
        },
      );
  }

  public async post<T, P>(url: string, data: P, setting?: AxiosRequestConfig) {
    const finalSetting = { ...(setting ? setting : { params: {} }), baseURL: this.domian };
    return super.post<T, P>(url, data, { ...finalSetting, headers: {  } })
      .then(
        res => {
          // if (res) {
          //   return res.data;
          // }
          return res;
        },
      );
  }

  public async put<T, P>(url: string, data: P, setting?: AxiosRequestConfig) {
    const finalSetting = { ...(setting ? setting : { params: {} }), baseURL: this.domian };
    return super.put<T, P>(url, data, { ...finalSetting, headers: {  } })
      .then(
        res => {
          return res;
        },
      );
  }

  public async delete(url: string, setting?: AxiosRequestConfig) {
    const finalSetting = { ...(setting ? setting : { params: {} }), baseURL: this.domian };
    return super.delete(url, { ...finalSetting, headers: {  } })
      .then(res => { return res.data; });
  }
}

export interface ICtxGet<TParams = any> {
  params: TParams;
}

export interface ICtxCreate<TBody = any> {
  body: TBody;
}

export interface ICtxUpdate<TParams = any, TBody = any> {
  params: TParams;
  body: TBody;
}

export interface ICtxDelete<TParams = any> {
  params: TParams;
}

export interface ICtxDeleteByUuid extends ICtxDelete<{ uuid: string }> {}

export interface ICtxGetByUuid extends ICtxGet<{ uuid: string }> {}

export interface ICtxGetBySlug extends ICtxGet<{ slug: string }> {}

export interface ICtxGetByCafe extends ICtxGet<{ idCafe: string }> {}

export interface ICtxGetManyByUuids extends ICtxGet<{ uuids: string[] }> {}

export interface ICtxUpdateIsUsedMerRedeemByUuids
  extends ICtxUpdate<{ uuids: string[] }, { isUsed: boolean }> {}

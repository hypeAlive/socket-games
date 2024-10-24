export type ApiCreateGame = {
    namespace: string,
    hasPassword: boolean,
    password?: string,
}

export type ApiGameHash = {
    hash: string
}
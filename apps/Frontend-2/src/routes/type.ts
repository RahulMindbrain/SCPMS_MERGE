export interface RouteOptions<T> {
    path: string;
    component: React.FC<T>;
}

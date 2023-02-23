/* eslint-disable @typescript-eslint/naming-convention */
export interface BackgroundRemoverResponse{
    status: string;
    processed_video?: string;
    foreground?: string;
    background?: string;
}

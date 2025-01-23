import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' }) 

export class InteractionStatusService 
{ 
    private interactionInProgress = false; 
    setInteractionInProgress(inProgress: boolean)
    { 
        this.interactionInProgress = inProgress; 
    } 
    isInteractionInProgress(): boolean
    { 
        return this.interactionInProgress; 
    }
    
}
import { LightningElement, api, track, wire } from 'lwc';
import getProducts from '@salesforce/apex/ItemPurchaseController.getProducts';

export default class ItemPurchaseTool extends LightningElement {
    @api recordId;
    @track products = [];
    @track error;

    searchTerm = '';
    selectedFamily = '';
    selectedType = '';

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.loadProducts();
    }

    loadProducts() {
        getProducts({
            searchTerm: this.searchTerm,
            family: this.selectedFamily,
            type: this.selectedType
        })
        .then(result => {
            this.products = result;
            this.error = undefined;
        })
        .catch(error => {
            this.error = error;
            this.products = undefined;
        });
    }

    connectedCallback() {
        this.loadProducts();
    }
}
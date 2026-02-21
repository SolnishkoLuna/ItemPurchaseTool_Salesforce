import { LightningElement, api, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import getProducts from '@salesforce/apex/ItemPurchaseController.getProducts';

export default class ItemPurchaseTool extends LightningElement {
    @api recordId;
    @track products = [];
    @track cart = [];
    searchTerm = '';
    selectedFamily = '';

    unsplashKey = 'ETkzUrwK1ACYUyaHjlxntGxuy5BgMOowrIBoZNl3O6M';

    // Данные для верхней панели (заглушки, так как recordId подтянется сам)
    accountName = 'Account Name';
    accountNumber = '12345';
    accountIndustry = 'Industry';

    get itemsCount() {
        return this.products ? this.products.length : 0;
    }

    get isCartEmpty() {
        return this.cart.length === 0;
    }

    get familyOptions() {
        return [
            { label: 'All Families', value: '' },
            { label: 'Software', value: 'Software' },
            { label: 'Hardware', value: 'Hardware' }
        ];
    }

    // Закрытие окна (кнопка Cancel или крестик)
    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    // Логика кнопки Cart
    handleCartClick() {
        if (!this.isCartEmpty) {
            alert('Proceeding to checkout with ' + this.cart.length + ' items');
        } else {
            alert('Your cart is empty!');
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.loadProducts();
    }

    handleFamilyChange(event) {
        this.selectedFamily = event.target.value;
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const rawProducts = await getProducts({
                searchTerm: this.searchTerm,
                family: this.selectedFamily
            });

            this.products = await Promise.all(rawProducts.map(async (prod) => {
                try {
                    const searchKeyword = prod.Name.split(' ').slice(0, 2).join(' ') + ' equipment';
                    const response = await fetch(
                        `https://api.unsplash.com/search/photos?query=${searchKeyword}&client_id=${this.unsplashKey}&per_page=1`
                    );
                    const data = await response.json();
                    const imageUrl = data.results && data.results.length > 0
                        ? data.results[0].urls.small
                        : 'https://via.placeholder.com/150?text=No+Image';
                    return { ...prod, imageUrl };
                } catch (error) {
                    return { ...prod, imageUrl: 'https://via.placeholder.com/150?text=Error' };
                }
            }));
        } catch (error) {
            console.error('Error loading products', error);
        }
    }

    handleAddToCart(event) {
        const productId = event.target.dataset.id;
        const product = this.products.find(item => item.Id === productId);
        if (product && !this.cart.some(item => item.Id === productId)) {
            this.cart = [...this.cart, product];
        }
    }

    connectedCallback() {
        this.loadProducts();
    }
}
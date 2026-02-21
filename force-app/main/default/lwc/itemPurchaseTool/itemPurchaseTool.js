import { LightningElement, api, track } from 'lwc';
import getProducts from '@salesforce/apex/ItemPurchaseController.getProducts';

export default class ItemPurchaseTool extends LightningElement {
    @api recordId;
    @track products = [];
    @track cart = [];
    @track isModalOpen = false;
    searchTerm = '';
    selectedFamily = '';

    unsplashKey = 'ETkzUrwK1ACYUyaHjlxntGxuy5BgMOowrIBoZNl3O6M';

    get itemsCount() {
        return this.products ? this.products.length : 0;
    }

    get isCartEmpty() {
        return this.cart.length === 0;
    }
    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleConfirmPurchase() {
        alert('Order for ' + this.cart.length + ' items has been placed!');
        this.cart = [];
        this.isModalOpen = false;
    }

    get familyOptions() {
        return [
            { label: 'All Families', value: '' },
            { label: 'Software', value: 'Software' },
            { label: 'Hardware', value: 'Hardware' }
        ];
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
                    const searchKeyword = prod.Name.split(' ').slice(0, 2).join(' ');

                    const response = await fetch(
                        `https://api.unsplash.com/search/photos?query=${searchKeyword}&client_id=${this.unsplashKey}&per_page=1`
                    );
                    const data = await response.json();

                    const imageUrl = data.results && data.results.length > 0
                        ? data.results[0].urls.small
                        : 'https://via.placeholder.com/150?text=No+Image';

                    return { ...prod, imageUrl };
                } catch (apiError) {
                    console.error('Ошибка Unsplash для ' + prod.Name, apiError);
                    return { ...prod, imageUrl: 'https://via.placeholder.com/150?text=Error' };
                }
            }));
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
        }
    }

    handleAddToCart(event) {
            const productId = event.target.dataset.id;
            const product = this.products.find(item => item.Id === productId);

            if (product) {
                const isAlreadyInCart = this.cart.some(item => item.Id === productId);
                if (!isAlreadyInCart) {
                    // Используем спред-оператор [...], чтобы LWC заметил изменение массива
                    this.cart = [...this.cart, product];
                }
            }
        }
    connectedCallback() {
        this.loadProducts();
    }
}
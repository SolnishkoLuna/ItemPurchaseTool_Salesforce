public with sharing class ItemPurchaseController {
	@AuraEnabled(cacheable=true)
	public static List<Product2> getProducts(String searchTerm) {
		if (String.isBlank(searchTerm)) return new List<Product2>();

		String key = '%' + searchTerm + '%';
		return [SELECT Id, Name, ProductCode, Description
		FROM Product2
		WHERE Name LIKE :key
		LIMIT 10];
	}
}
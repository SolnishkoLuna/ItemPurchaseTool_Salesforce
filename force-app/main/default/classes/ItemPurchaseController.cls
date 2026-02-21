public with sharing class ItemPurchaseController {
	@AuraEnabled(cacheable=true)
	public static List<Product2> getProducts(String searchTerm, String family) {
		String key = '%' + searchTerm + '%';

		String query = 'SELECT Id, Name, ProductCode, Description, Family FROM Product2 WHERE Name LIKE :key';

		if (String.isNotBlank(family)) {
			query += ' AND Family = :family';
		}

		query += ' LIMIT 10';
		return Database.query(query);
	}
}
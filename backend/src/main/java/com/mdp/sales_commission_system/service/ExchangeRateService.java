package com.mdp.sales_commission_system.service;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExchangeRateService {

    private final Map<String, Double> rates = new HashMap<>();
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 3600000; // 1 Hour

    public ExchangeRateService() {
        // Initial Seed (Fallback)
        rates.put("TRY", 1.0);
        rates.put("USD", 35.0); // Approx fallback
        rates.put("EUR", 38.0); // Approx fallback
    }

    public double getRate(String currency) {
        if ("TRY".equalsIgnoreCase(currency))
            return 1.0;

        // Refresh cache if needed
        if (System.currentTimeMillis() - lastFetchTime > CACHE_DURATION) {
            fetchRatesFromTCMB();
        }

        return rates.getOrDefault(currency.toUpperCase(), 1.0);
    }

    private void fetchRatesFromTCMB() {
        try {
            String url = "https://www.tcmb.gov.tr/kurlar/today.xml";
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new URL(url).openStream());
            doc.getDocumentElement().normalize();

            NodeList nodeList = doc.getElementsByTagName("Currency");

            for (int i = 0; i < nodeList.getLength(); i++) {
                Node node = nodeList.item(i);
                if (node.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) node;
                    String code = element.getAttribute("CurrencyCode");

                    if ("USD".equals(code) || "EUR".equals(code)) {
                        // "ForexSelling" or "BanknoteSelling" - usually related. usage ForexSelling for
                        // standard.
                        String rateStr = element.getElementsByTagName("ForexSelling").item(0).getTextContent();
                        if (rateStr != null && !rateStr.isEmpty()) {
                            double rate = Double.parseDouble(rateStr.replace(",", ".")); // TCMB uses dot decimal? No,
                                                                                         // check format.
                            // XML usually uses dot as current standard in digital but let's be safe.
                            // Actually TCMB XML uses dot (.) e.g <ForexSelling>36.1234</ForexSelling>
                            rates.put(code, rate);
                        }
                    }
                }
            }
            lastFetchTime = System.currentTimeMillis();
            System.out.println("TCMB Rates Updated: " + rates);

        } catch (Exception e) {
            System.err.println("Error fetching TCMB rates: " + e.getMessage());
            // Keep old rates
        }
    }
}

import com.sap.gateway.ip.core.customdev.util.Message
import javax.xml.parsers.DocumentBuilderFactory
import org.xml.sax.InputSource

def Message processData(Message message) {
    // Stream XML using standard Java DOM parser (works on all Groovy versions)
    def reader = message.getBody(java.io.Reader.class)
    def factory = DocumentBuilderFactory.newInstance()
    def builder = factory.newDocumentBuilder()
    def doc = builder.parse(new InputSource(reader))
    
    // 1. Extract <postalCode> and validate 4-digit Danish format
    def postalNodes = doc.getElementsByTagName("postalCode")
    String postalCode = (postalNodes.getLength() > 0) ? postalNodes.item(0).getTextContent().trim() : ""
    
    if (!postalCode.matches("\\d{4}")) {
        message.setHeader("CamelHttpResponseCode", 400)
        throw new Exception("Invalid Danish Postal Code: " + postalCode + ". Must be 4 digits.")
    }
    
    // 2. Extract <totalAmount>
    def totalNodes = doc.getElementsByTagName("totalAmount")
    String totalStr = (totalNodes.getLength() > 0) ? totalNodes.item(0).getTextContent().trim() : "0"
    double totalAmount = totalStr ? totalStr.toDouble() : 0.0
    
    // 3. Determine Priority and Set Header & Property for Routing & Next.js UI
    String priority = (totalAmount > 1000.0) ? "HIGH" : "STANDARD"
    
    message.setProperty("OrderTotalAmount", totalAmount)
    message.setProperty("OrderPriority", priority)
    message.setHeader("X-Order-Priority", priority)
    
    return message
}
// 예시: src/main/java/com/yourcompany/yourproject/sales/dto/SalesEntryDataDto.java
package com.mceback.dto;

public class SalesEntryDataDto {
    private String customerName;
    private String customerPhone;
    private Double customerLatitude;  // Double로 변경 (null 가능)
    private Double customerLongitude; // Double로 변경 (null 가능)
    private String drivingDistanceKm; // "1.23 km" 형태 그대로 받을 경우 String
    // private double drivingDistance; // 백엔드에서 다시 double로 파싱하여 저장할 경우 (예: "1.23 km" -> 1.23)
    // ... 기타 필요한 필드들 (상품명, 수량, 비고 등)

    // Getter, Setter, Constructors (롬복 사용 시 @Data 어노테이션으로 대체 가능)
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public Double getCustomerLatitude() { return customerLatitude; }
    public void setCustomerLatitude(Double customerLatitude) { this.customerLatitude = customerLatitude; }
    public Double getCustomerLongitude() { return customerLongitude; }
    public void setCustomerLongitude(Double customerLongitude) { this.customerLongitude = customerLongitude; }
    public String getDrivingDistanceKm() { return drivingDistanceKm; }
    public void setDrivingDistanceKm(String drivingDistanceKm) { this.drivingDistanceKm = drivingDistanceKm; }
}
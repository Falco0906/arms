package com.arms.platform.material;

public class RankingRow {
  private Long userId;
  private String name;
  private Long uploads;

  public RankingRow(Long userId, String name, Long uploads) {
    this.userId = userId; this.name = name; this.uploads = uploads;
  }
  public Long getUserId(){return userId;}
  public String getName(){return name;}
  public Long getUploads(){return uploads;}
}

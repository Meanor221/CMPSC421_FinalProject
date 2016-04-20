
package Model;

import java.io.Serializable;


public class Entity implements Serializable {
    private String lectureID;
    private String pageID;
    private String entityID;
    private String entityType;
    private String entityX;
    private String entityY;
    private String entityZ;
    private String entityContent;
    private String entityAnimation;
    private String entityWidth;
    private String entityHeight;

    public String getLectureID() {
        return lectureID;
    }

    public void setLectureID(String lectureID) {
        this.lectureID = lectureID;
    }

    public String getPageID() {
        return pageID;
    }

    public void setPageID(String pageID) {
        this.pageID = pageID;
    }

    public String getEntityID() {
        return entityID;
    }

    public void setEntityID(String entityID) {
        this.entityID = entityID;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityContent() {
        return entityContent;
    }

    public void setEntityContent(String entityContent) {
        this.entityContent = entityContent;
    }

    public String getEntityAnimation() {
        return entityAnimation;
    }

    public void setEntityAnimation(String entityAnimation) {
        this.entityAnimation = entityAnimation;
    }

    public String getEntityX() {
        return entityX;
    }

    public void setEntityX(String entityX) {
        this.entityX = entityX;
    }
    
    public String getEntityY() {
        return entityY;
    }

    public void setEntityY(String entityY) {
        this.entityY = entityY;
    }
    
    public String getEntityZ() {
        return entityZ;
    }

    public void setEntityZ(String entityZ) {
        this.entityZ = entityZ;
    }
    
    public String getEntityWidth() {
        return entityWidth;
    }

    public String getEntityHeight() {
        return entityHeight;
    }

    public void setEntityWidth(String entityWidth) {
        this.entityWidth = entityWidth;
    }

    public void setEntityHeight(String entityHeight) {
        this.entityHeight = entityHeight;
    }
}

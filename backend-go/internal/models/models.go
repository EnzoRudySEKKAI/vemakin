package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID            string  `db:"id" json:"id"`
	Email         string  `db:"email" json:"email"`
	Name          string  `db:"name" json:"name"`
	DarkMode      *bool   `db:"dark_mode" json:"darkMode"`
	LastProjectID *string `db:"last_project_id" json:"lastProjectId"`
}

type Project struct {
	ID        string       `db:"id" json:"id"`
	Name      string       `db:"name" json:"name"`
	UserID    string       `db:"user_id" json:"userId"`
	CreatedAt time.Time    `db:"created_at" json:"createdAt"`
	UpdatedAt sql.NullTime `db:"updated_at" json:"updatedAt"`
}

type Shot struct {
	ID                   string          `db:"id" json:"id"`
	ProjectID            string          `db:"project_id" json:"projectId"`
	Title                string          `db:"title" json:"title"`
	Description          string          `db:"description" json:"description"`
	Status               string          `db:"status" json:"status"`
	StartTime            sql.NullString  `db:"start_time" json:"startTime"`
	Duration             string          `db:"duration" json:"duration"`
	Location             string          `db:"location" json:"location"`
	LocationLat          sql.NullFloat64 `db:"location_lat" json:"locationLat"`
	LocationLng          sql.NullFloat64 `db:"location_lng" json:"locationLng"`
	Remarks              sql.NullString  `db:"remarks" json:"remarks"`
	Date                 sql.NullString  `db:"date" json:"date"`
	SceneNumber          sql.NullString  `db:"scene_number" json:"sceneNumber"`
	EquipmentIDs         []byte          `db:"equipment_ids" json:"equipmentIds"`
	PreparedEquipmentIDs []byte          `db:"prepared_equipment_ids" json:"preparedEquipmentIds"`
	CreatedAt            time.Time       `db:"created_at" json:"createdAt"`
	UpdatedAt            sql.NullTime    `db:"updated_at" json:"updatedAt"`
}

type Equipment struct {
	ID              string       `db:"id" json:"id"`
	UserID          string       `db:"user_id" json:"userId"`
	Name            string       `db:"name" json:"name"`
	CatalogItemID   *string      `db:"catalog_item_id" json:"catalogItemId"`
	CustomName      *string      `db:"custom_name" json:"customName"`
	SerialNumber    *string      `db:"serial_number" json:"serialNumber"`
	Category        string       `db:"category" json:"category"`
	PricePerDay     float64      `db:"price_per_day" json:"pricePerDay"`
	RentalPrice     *float64     `db:"rental_price" json:"rentalPrice"`
	RentalFrequency *string      `db:"rental_frequency" json:"rentalFrequency"`
	Quantity        int          `db:"quantity" json:"quantity"`
	IsOwned         bool         `db:"is_owned" json:"isOwned"`
	Status          string       `db:"status" json:"status"`
	BrandName       *string      `db:"brand_name" json:"brandName"`
	ModelName       *string      `db:"model_name" json:"modelName"`
	CreatedAt       time.Time    `db:"created_at" json:"createdAt"`
	UpdatedAt       sql.NullTime `db:"updated_at" json:"updatedAt"`
}

type Note struct {
	ID        string       `db:"id" json:"id"`
	ProjectID string       `db:"project_id" json:"projectId"`
	Title     string       `db:"title" json:"title"`
	Content   string       `db:"content" json:"content"`
	ShotID    *string      `db:"shot_id" json:"shotId"`
	TaskID    *string      `db:"task_id" json:"taskId"`
	CreatedAt time.Time    `db:"created_at" json:"createdAt"`
	UpdatedAt sql.NullTime `db:"updated_at" json:"updatedAt"`
}

type PostProdTask struct {
	ID          string       `db:"id" json:"id"`
	ProjectID   string       `db:"project_id" json:"projectId"`
	Category    string       `db:"category" json:"category"`
	Title       string       `db:"title" json:"title"`
	Status      string       `db:"status" json:"status"`
	Priority    string       `db:"priority" json:"priority"`
	DueDate     *string      `db:"due_date" json:"dueDate"`
	Description *string      `db:"description" json:"description"`
	CreatedAt   time.Time    `db:"created_at" json:"createdAt"`
	UpdatedAt   sql.NullTime `db:"updated_at" json:"updatedAt"`
}

type Brand struct {
	ID   string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type Category struct {
	ID   string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	Slug string `db:"slug" json:"slug"`
}

type GearCatalog struct {
	ID          string    `db:"id" json:"id"`
	BrandID     string    `db:"brand_id" json:"brandId"`
	CategoryID  string    `db:"category_id" json:"categoryId"`
	Name        string    `db:"name" json:"name"`
	Description *string   `db:"description" json:"description"`
	ImageURL    *string   `db:"image_url" json:"imageUrl"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
}

type CameraSpecs struct {
	GearID       string `db:"gear_id" json:"gearId"`
	Sensor       string `db:"sensor" json:"sensor"`
	Resolution   string `db:"resolution" json:"resolution"`
	Mount        string `db:"mount" json:"mount"`
	DynamicRange string `db:"dynamic_range" json:"dynamicRange"`
	NativeISO    string `db:"native_iso" json:"nativeIso"`
	Media        string `db:"media" json:"media"`
	FrameRate    string `db:"frame_rate" json:"frameRate"`
	Weight       string `db:"weight" json:"weight"`
}

type LensSpecs struct {
	GearID      string `db:"gear_id" json:"gearId"`
	FocalLength string `db:"focal_length" json:"focalLength"`
	Aperture    string `db:"aperture" json:"aperture"`
	Mount       string `db:"mount" json:"mount"`
	Coverage    string `db:"coverage" json:"coverage"`
	FocusType   string `db:"focus_type" json:"focusType"`
	Weight      string `db:"weight" json:"weight"`
}

type AudioSpecs struct {
	GearID       string `db:"gear_id" json:"gearId"`
	Type         string `db:"type" json:"type"`
	Pattern      string `db:"pattern" json:"pattern"`
	FreqResponse string `db:"freq_response" json:"freqResponse"`
	Sensitivity  string `db:"sensitivity" json:"sensitivity"`
	MaxSPL       string `db:"max_spl" json:"maxSpl"`
	Power        string `db:"power" json:"power"`
	Connector    string `db:"connector" json:"connector"`
	Weight       string `db:"weight" json:"weight"`
}

type LightSpecs struct {
	GearID    string `db:"gear_id" json:"gearId"`
	Type      string `db:"type" json:"type"`
	PowerDraw string `db:"power_draw" json:"powerDraw"`
	ColorTemp string `db:"color_temp" json:"colorTemp"`
	CRI       string `db:"cri" json:"cri"`
	Mount     string `db:"mount" json:"mount"`
	Control   string `db:"control" json:"control"`
	Weight    string `db:"weight" json:"weight"`
}

type MonitorSpecs struct {
	GearID     string `db:"gear_id" json:"gearId"`
	Screen     string `db:"screen" json:"screen"`
	Resolution string `db:"resolution" json:"resolution"`
	Brightness string `db:"brightness" json:"brightness"`
	Inputs     string `db:"inputs" json:"inputs"`
	Power      string `db:"power" json:"power"`
	Features   string `db:"features" json:"features"`
	Dimensions string `db:"dimensions" json:"dimensions"`
	Weight     string `db:"weight" json:"weight"`
}

type PropSpecs struct {
	GearID     string `db:"gear_id" json:"gearId"`
	Type       string `db:"type" json:"type"`
	Era        string `db:"era" json:"era"`
	Material   string `db:"material" json:"material"`
	Condition  string `db:"condition" json:"condition"`
	Quantity   string `db:"quantity" json:"quantity"`
	Dimensions string `db:"dimensions" json:"dimensions"`
	Power      string `db:"power" json:"power"`
	Weight     string `db:"weight" json:"weight"`
}

type StabilizerSpecs struct {
	GearID       string `db:"gear_id" json:"gearId"`
	Type         string `db:"type" json:"type"`
	MaxPayload   string `db:"max_payload" json:"maxPayload"`
	Axes         string `db:"axes" json:"axes"`
	BatteryLife  string `db:"battery_life" json:"batteryLife"`
	Connectivity string `db:"connectivity" json:"connectivity"`
	Dimensions   string `db:"dimensions" json:"dimensions"`
	Weight       string `db:"weight" json:"weight"`
}

type TripodSpecs struct {
	GearID         string `db:"gear_id" json:"gearId"`
	HeadType       string `db:"head_type" json:"headType"`
	MaxPayload     string `db:"max_payload" json:"maxPayload"`
	BowlSize       string `db:"bowl_size" json:"bowlSize"`
	HeightRange    string `db:"height_range" json:"heightRange"`
	Material       string `db:"material" json:"material"`
	Counterbalance string `db:"counterbalance" json:"counterbalance"`
	Weight         string `db:"weight" json:"weight"`
}

type WirelessSpecs struct {
	GearID     string `db:"gear_id" json:"gearId"`
	Range      string `db:"range" json:"range"`
	Delay      string `db:"delay" json:"delay"`
	Resolution string `db:"resolution" json:"resolution"`
	Inputs     string `db:"inputs" json:"inputs"`
	Freq       string `db:"freq" json:"freq"`
	Power      string `db:"power" json:"power"`
	Multicast  string `db:"multicast" json:"multicast"`
	Weight     string `db:"weight" json:"weight"`
}

type DroneSpecs struct {
	GearID       string `db:"gear_id" json:"gearId"`
	Type         string `db:"type" json:"type"`
	Camera       string `db:"camera" json:"camera"`
	Res          string `db:"res" json:"res"`
	FlightTime   string `db:"flight_time" json:"flightTime"`
	Transmission string `db:"transmission" json:"transmission"`
	Sensors      string `db:"sensors" json:"sensors"`
	Speed        string `db:"speed" json:"speed"`
	Weight       string `db:"weight" json:"weight"`
}

type FilterSpecs struct {
	GearID   string `db:"gear_id" json:"gearId"`
	Type     string `db:"type" json:"type"`
	Density  string `db:"density" json:"density"`
	Size     string `db:"size" json:"size"`
	Stops    string `db:"stops" json:"stops"`
	Effect   string `db:"effect" json:"effect"`
	Strength string `db:"strength" json:"strength"`
	Mount    string `db:"mount" json:"mount"`
	Material string `db:"material" json:"material"`
	Weight   string `db:"weight" json:"weight"`
}

type GripSpecs struct {
	GearID    string `db:"gear_id" json:"gearId"`
	Type      string `db:"type" json:"type"`
	MaxLoad   string `db:"max_load" json:"maxLoad"`
	MaxHeight string `db:"max_height" json:"maxHeight"`
	MinHeight string `db:"min_height" json:"minHeight"`
	Footprint string `db:"footprint" json:"footprint"`
	Material  string `db:"material" json:"material"`
	Mount     string `db:"mount" json:"mount"`
	Weight    string `db:"weight" json:"weight"`
}
